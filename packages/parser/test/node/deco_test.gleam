import gleam/option.{Some}
import monadic_parser/parser as mp
import scrapbox/node/node.{Deco, Plain}
import scrapbox/node/parser

pub fn deco_test() {
  let p = parser.deco(parser.Options(False, False, False))
  assert mp.parse(p, "[** bold text]")
    == Some(#(Deco("[** bold text]", [Plain("bold text")]), ""))
  assert mp.parse(p, "[!  important text ]abc")
    == Some(#(Deco("[!  important text ]", [Plain(" important text ")]), "abc"))
  assert mp.parse(p, "[! [* nested]]abc")
    == Some(#(Deco("[! [* nested]]", [Plain("[* nested]")]), "abc"))
}
