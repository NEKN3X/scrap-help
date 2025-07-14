import helpfeel/parser

pub fn helpfeel_test() {
  let e = parser.expand
  assert e("helpfeel") == Ok(["helpfeel"])
  assert e("(abc| 1 2 3)") == Ok(["abc", "1 2 3"])
  assert e("1(a|b)23") == Ok(["1a23", "1b23"])
  assert e("") == Error(parser.InvalidInput(""))
  assert e("a|b") == Error(parser.UnusedInput("|b"))
  assert e("a|") == Error(parser.UnusedInput("|"))
  assert e("1(a|b|23") == Error(parser.UnusedInput("(a|b|23"))
  assert e("1(|a|b)23") == Ok(["123", "1a23", "1b23"])
  assert e("1(a|b|)23") == Ok(["1a23", "1b23", "123"])
  assert e("1( |a|b| c de)23") == Ok(["123", "1a23", "1b23", "1c de23"])
}
