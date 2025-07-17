import gleam/option.{Some}
import monadic_parser/parser as mp
import scrapbox/node/node.{Deco, Plain}
import scrapbox/node/parser

pub fn parser_test() {
  let p = parser.parser(node.default_options())
  assert mp.parse(p, "plain text") == Some(#([Plain("plain text")], ""))
  assert mp.parse(p, "plain[** deco]text")
    == Some(#(
      [Plain("plain"), Deco("[** deco]", [Plain("deco")]), Plain("text")],
      "",
    ))
  assert mp.parse(p, "abc#tag") == Some(#([Plain("abc#tag")], ""))
}
