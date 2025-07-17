import gleam/option.{Some}
import monadic_parser/parser.{parse}
import scrapbox/node/node.{Plain}

pub fn plain_test() {
  let p = node.plain()
  assert parse(p, "plain text") == Some(#(Plain("plain text"), ""))
  assert parse(p, " plain text ") == Some(#(Plain(" plain text "), ""))
  assert parse(p, "plain text\n") == Some(#(Plain("plain text"), "\n"))
  assert parse(p, "plain text\nabc") == Some(#(Plain("plain text"), "\nabc"))
  assert parse(p, "") == Some(#(Plain(""), ""))
  assert parse(p, " \tplain text\nabc")
    == Some(#(Plain(" \tplain text"), "\nabc"))
}
