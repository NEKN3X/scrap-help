import gleam/option.{Some}
import monadic_parser/parser.{parse}
import scrapbox/node/node.{Deco, Plain}

pub fn deco_test() {
  let p = node.deco()
  assert parse(p, "[** bold text]")
    == Some(#(Deco("[** bold text]", [Plain("bold text")]), ""))
  assert parse(p, "[!  important text ]abc")
    == Some(#(Deco("[!  important text ]", [Plain(" important text ")]), "abc"))
}
