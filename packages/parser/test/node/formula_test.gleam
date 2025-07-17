import gleam/option.{None, Some}
import monadic_parser/parser as mp
import scrapbox/node/formula
import scrapbox/node/node.{Formula}

pub fn formula_test() {
  let p = formula.parser(node.Options(False, False, False))
  assert mp.parse(p, "[$ formula text]")
    == Some(#(Formula("[$ formula text]", "formula text"), ""))
  assert mp.parse(p, "[$ formula] text]abc")
    == Some(#(Formula("[$ formula]", "formula"), " text]abc"))
  assert mp.parse(p, "[$ formula] text ]abc")
    == Some(#(Formula("[$ formula] text ]", "formula] text"), "abc"))
  assert mp.parse(p, "[$formula text]") == None
  assert mp.parse(p, "[$ formula text") == None
  assert mp.parse(p, "$ formula text") == None
}
