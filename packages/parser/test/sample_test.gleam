import sample

pub fn eval_test() {
  assert sample.eval("2*3+4") == Ok(10)
  assert sample.eval("2*(3+4)") == Ok(14)
  assert sample.eval("2*3^4") == Error("unused input ^4")
  assert sample.eval("one plus two") == Error("invalid input")
}
