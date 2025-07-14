import gleam/option.{Some}
import parser.{type Parser}

pub fn expr() -> Parser(Int) {
  use t <- parser.bind(term())
  {
    use _ <- parser.bind(parser.symbol("+"))
    use e <- parser.bind(expr())
    parser.pure(t + e)
  }
  |> parser.alt(parser.pure(t))
}

pub fn term() -> Parser(Int) {
  use f <- parser.bind(factor())
  {
    use _ <- parser.bind(parser.symbol("*"))
    use t <- parser.bind(term())
    parser.pure(f * t)
  }
  |> parser.alt(parser.pure(f))
}

pub fn factor() -> Parser(Int) {
  {
    use _ <- parser.bind(parser.symbol("("))
    use e <- parser.bind(expr())
    use _ <- parser.bind(parser.symbol(")"))
    parser.pure(e)
  }
  |> parser.alt(parser.natural())
}

pub fn eval(xs: String) -> Result(Int, String) {
  case parser.parse(expr(), xs) {
    Some(#(n, "")) -> Ok(n)
    Some(#(_, out)) -> Error("unused input " <> out)
    _ -> Error("invalid input")
  }
}
