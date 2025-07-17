import gleam/option.{Some}
import monadic_parser/parser as mp
import scrapbox/node/node.{Plain}
import scrapbox/node/parser

pub fn plain_test() {
  let p = parser.plain()
  assert mp.parse(p, "plain text") == Some(#([Plain("plain text")], ""))
  assert mp.parse(p, " plain text ") == Some(#([Plain(" plain text ")], ""))
  assert mp.parse(p, "plain text\n") == Some(#([Plain("plain text")], "\n"))
  assert mp.parse(p, "plain text\nabc")
    == Some(#([Plain("plain text")], "\nabc"))
  assert mp.parse(p, "") == Some(#([Plain("")], ""))
  assert mp.parse(p, " \tplain text\nabc")
    == Some(#([Plain(" \tplain text")], "\nabc"))
}
