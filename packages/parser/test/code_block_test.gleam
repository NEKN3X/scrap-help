import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/code_block.{CodeBlock}

pub fn code_block_test() {
  let p = code_block.parser()
  assert parse(p, "code: title\n  line1\n  line2")
    == Some(#(CodeBlock(0, "title", " line1\n line2"), ""))
  assert parse(p, "") == None
  assert parse(p, "code:title") == Some(#(CodeBlock(0, "title", ""), ""))
  assert parse(p, "code:title\n") == Some(#(CodeBlock(0, "title", ""), ""))
  assert parse(p, "code:title\nabc")
    == Some(#(CodeBlock(0, "title", ""), "abc"))
  assert parse(p, "code:title\nabc")
    == Some(#(CodeBlock(0, "title", ""), "abc"))
  assert parse(p, "  code:title\n   abc\n123")
    == Some(#(CodeBlock(2, "title", "abc"), "123"))
}
