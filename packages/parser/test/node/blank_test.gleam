import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/node/node.{Blank}

pub fn blank_test() {
  let p = node.blank()
  assert parse(p, "[ ]") == Some(#(Blank("[ ]"), ""))
  assert parse(p, "[ 　]") == Some(#(Blank("[ 　]"), ""))
  assert parse(p, "[ 　\t]") == Some(#(Blank("[ 　\t]"), ""))
  assert parse(p, "[]") == None
  assert parse(p, "[abc]") == None
}
