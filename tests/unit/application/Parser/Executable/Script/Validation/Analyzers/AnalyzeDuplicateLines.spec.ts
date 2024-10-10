import { describe } from 'vitest';
import { analyzeDuplicateLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeDuplicateLines';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import type { CodeLine, InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { SyntaxFactory } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/SyntaxFactory';
import { SyntaxFactoryStub } from '@tests/unit/shared/Stubs/SyntaxFactoryStub';
import { createCodeLines } from './CreateCodeLines';
import { expectSameInvalidCodeLines } from './ExpectSameInvalidCodeLines';

describe('AnalyzeDuplicateLines', () => {
  describe('analyzeDuplicateLines', () => {
    it('returns no results for unique lines', () => {
      // arrange
      const expected = createExpectedDuplicateLineErrors([]);
      const context = new TestContext()
        .withLines([
          /* 1 */ 'unique1', /* 2 */ 'unique2', /* 3 */ 'unique3', /* 4 */ 'unique4',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies single duplicated line', () => {
      // arrange
      const expected = createExpectedDuplicateLineErrors([1, 2, 4]);
      const context = new TestContext()
        .withLines([
          /* 1 */ 'duplicate', /* 2 */ 'duplicate', /* 3 */ 'unique', /* 4 */ 'duplicate',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies multiple duplicated lines', () => {
      // arrange
      const expected = createExpectedDuplicateLineErrors([1, 4], [2, 6]);
      const context = new TestContext()
        .withLines([
          /* 1 */ 'duplicate1', /* 2 */ 'duplicate2', /* 3 */ 'unique',
          /* 4 */ 'duplicate1', /* 5 */ 'unique2', /* 6 */ 'duplicate2',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    describe('syntax handling', () => {
      it('uses correct language for syntax creation', () => {
        // arrange
        const expectedLanguage = ScriptingLanguage.batchfile;
        let actualLanguage: ScriptingLanguage | undefined;
        const factory: SyntaxFactory = (language) => {
          actualLanguage = language;
          return new LanguageSyntaxStub();
        };
        const context = new TestContext()
          .withLanguage(expectedLanguage)
          .withSyntaxFactory(factory);
        // act
        context.analyze();
        // assert
        expect(actualLanguage).to.equal(expectedLanguage);
      });
      describe('common code parts', () => {
        it('ignores multiple occurrences of common code parts', () => {
          // arrange
          const expected = createExpectedDuplicateLineErrors([3, 4]);
          const syntax = new LanguageSyntaxStub()
            .withCommonCodeParts('good', 'also-good');
          const context = new TestContext()
            .withLines([
              /* 1 */ 'good', /* 2 */ 'good', /* 3 */ 'bad', /* 4 */ 'bad',
              /* 5 */ 'good', /* 6 */ 'also-good', /* 7 */ 'also-good', /* 8 */ 'unique',
            ])
            .withSyntaxFactory(() => syntax);
          // act
          const actual = context.analyze();
          // assert
          expectSameInvalidCodeLines(actual, expected);
        });
        it('ignores common code parts used in same line', () => {
          // arrange
          const expected = createExpectedDuplicateLineErrors([1, 2]);
          const syntax = new LanguageSyntaxStub()
            .withCommonCodeParts('good2', 'good1');
          const context = new TestContext()
            .withLines([
              /* 1 */ 'bad', /* 2 */ 'bad', /* 3 */ 'good1 good2',
              /* 4 */ 'good1 good2', /* 5 */ 'good2 good1', /* 6 */ 'good2 good1',
            ])
            .withSyntaxFactory(() => syntax);
          // act
          const actual = context.analyze();
          // assert
          expectSameInvalidCodeLines(actual, expected);
        });
        it('detects duplicates with common parts and unique words', () => {
          // arrange
          const expected = createExpectedDuplicateLineErrors([4, 5], [8, 9]);
          const syntax = new LanguageSyntaxStub()
            .withCommonCodeParts('common-part1', 'common-part2');
          const context = new TestContext()
            .withLines([
              /* 1 */ 'common-part1', /* 2 */ 'common-part1', /* 3 */ 'common-part1 common-part2',
              /* 4 */ 'common-part1 unique', /* 5 */ 'common-part1 unique', /* 6 */ 'common-part2',
              /* 7 */ 'common-part2 common-part1', /* 8 */ 'unique common-part2', /* 9 */ 'unique common-part2',
            ])
            .withSyntaxFactory(() => syntax);
          // act
          const actual = context.analyze();
          // assert
          expectSameInvalidCodeLines(actual, expected);
        });
      });
      describe('comment handling', () => {
        it('ignores lines starting with comment delimiters', () => {
          // arrange
          const expected = createExpectedDuplicateLineErrors([3, 5]);
          const syntax = new LanguageSyntaxStub()
            .withCommentDelimiters('#', '//');
          const context = new TestContext()
            .withLines([
              /* 1 */ '#abc', /* 2 */ '#abc', /* 3 */ 'abc', /* 4 */ 'unique',
              /* 5 */ 'abc', /* 6 */ '//abc', /* 7 */ '//abc', /* 8 */ '//unique',
              /* 9 */ '#unique',
            ])
            .withSyntaxFactory(() => syntax);
          // act
          const actual = context.analyze();
          // assert
          expectSameInvalidCodeLines(actual, expected);
        });
        it('detects duplicates when comments are not at line start', () => {
          // arrange
          const expected = createExpectedDuplicateLineErrors([1, 2], [3, 4]);
          const syntax = new LanguageSyntaxStub()
            .withCommentDelimiters('#');
          const context = new TestContext()
            .withLines([
              /* 1 */ 'test #comment', /* 2 */ 'test #comment', /* 3 */ 'test2 # comment',
              /* 4 */ 'test2 # comment',
            ])
            .withSyntaxFactory(() => syntax);
          // act
          const actual = context.analyze();
          // assert
          expectSameInvalidCodeLines(actual, expected);
        });
      });
    });
  });
});

function createExpectedDuplicateLineErrors(
  ...lines: readonly ReadonlyArray<number>[]
): InvalidCodeLine[] {
  return lines.flatMap((occurrenceIndices): readonly InvalidCodeLine[] => occurrenceIndices
    .map((index): InvalidCodeLine => ({
      lineNumber: index,
      error: `Line is duplicated at line numbers ${occurrenceIndices.join(',')}.`,
    })));
}

export class TestContext {
  private codeLines: readonly CodeLine[] = createCodeLines(['test-code-line']);

  private language = ScriptingLanguage.batchfile;

  private syntaxFactory: SyntaxFactory = new SyntaxFactoryStub().get();

  public withLines(lines: readonly string[]): this {
    this.codeLines = createCodeLines(lines);
    return this;
  }

  public withLanguage(language: ScriptingLanguage): this {
    this.language = language;
    return this;
  }

  public withSyntaxFactory(syntaxFactory: SyntaxFactory): this {
    this.syntaxFactory = syntaxFactory;
    return this;
  }

  public analyze() {
    return analyzeDuplicateLines(
      this.codeLines,
      this.language,
      this.syntaxFactory,
    );
  }
}