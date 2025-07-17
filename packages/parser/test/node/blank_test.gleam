import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/node/blank
import scrapbox/node/node.{Blank}

pub fn blank_test() {
  let p = blank.parser(node.default_options())
  assert parse(p, "[ ]") == Some(#(Blank("[ ]", " "), ""))
  assert parse(p, "[ 　]") == Some(#(Blank("[ 　]", " 　"), ""))
  assert parse(p, "[ 　\t]") == Some(#(Blank("[ 　\t]", " 　\t"), ""))
  assert parse(p, "[]") == None
  assert parse(p, "[abc]") == None
}
