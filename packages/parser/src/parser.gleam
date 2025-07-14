import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import simple/char.{type Char}

pub type Parser(a) {
  P(parser: fn(String) -> Option(#(a, String)))
}

/// Parses the input string using the provided parser function.
pub fn parse(self: Parser(a), input: String) {
  self.parser(input)
}

/// Parses a single character from the input string.
pub fn item() -> Parser(Char) {
  P(fn(input) {
    case char.split_string(input) {
      [] -> None
      [x, ..xs] -> Some(#(x, char.join(xs)))
    }
  })
}

pub fn map(g: fn(a) -> b, p: Parser(a)) -> Parser(b) {
  P(fn(input) {
    case parse(p, input) {
      Some(#(v, out)) -> Some(#(g(v), out))
      None -> None
    }
  })
}

pub fn pure(a) -> Parser(a) {
  P(fn(input) { Some(#(a, input)) })
}

pub fn apply(pg: Parser(fn(a) -> b), px: Parser(a)) -> Parser(b) {
  P(fn(input) {
    case parse(pg, input) {
      Some(#(g, out)) -> parse(map(g, px), out)
      None -> None
    }
  })
}

pub fn bind(p: Parser(a), f: fn(a) -> Parser(b)) -> Parser(b) {
  P(fn(input) {
    case parse(p, input) {
      Some(#(v, out)) -> parse(f(v), out)
      None -> None
    }
  })
}

pub fn empty() -> Parser(a) {
  P(fn(_) { None })
}

pub fn alt(p: Parser(a), q: Parser(a)) -> Parser(a) {
  P(fn(input) {
    case parse(p, input) {
      Some(result) -> Some(result)
      None -> parse(q, input)
    }
  })
}

/// Parses a character that satisfies a predicate.
pub fn sat(p: fn(Char) -> Bool) {
  use x <- bind(item())
  case p(x) {
    True -> pure(x)
    False -> empty()
  }
}

pub fn digit() {
  sat(char.is_digit)
}

pub fn lower() {
  sat(char.is_lower)
}

pub fn upper() {
  sat(char.is_upper)
}

pub fn letter() {
  sat(char.is_alpha)
}

pub fn alpha_num() {
  sat(char.is_alpha_num)
}

pub fn char(x) {
  sat(char.equals(x, _))
}

pub fn string(s: String) {
  case char.split_string(s) {
    [x, ..xs] -> {
      use c <- bind(char(x))
      use rest <- bind(string(char.join(xs)))
      pure(char.to_string(c) <> rest)
    }
    [] -> pure("")
  }
}

pub fn many(p: Parser(a)) -> Parser(List(a)) {
  some(p) |> alt(pure([]))
}

fn defer(f: fn() -> Parser(a)) -> Parser(a) {
  P(fn(input) { parse(f(), input) })
}

pub fn some(x: Parser(a)) -> Parser(List(a)) {
  pure(fn(a) { list.append([a], _) })
  |> apply(x)
  |> apply(defer(fn() { many(x) }))
}

// 小文字で始まり、0個以上のアルファベットか数字が続く
pub fn ident() -> Parser(String) {
  use x <- bind(lower())
  use xs <- bind(many(alpha_num()))
  pure(x |> char.append(char.join(xs)))
}

// 数字が一つ以上繰り返される自然数
pub fn nat() {
  use xs <- bind(some(digit()))
  case int.parse(char.join(xs)) {
    Ok(n) -> pure(n)
    Error(_) -> empty()
  }
}

// 空白文字、タブ文字または改行文字が一つ以上繰り返される
pub fn space() -> Parser(Nil) {
  use _ <- bind(many(sat(char.is_space)))
  pure(Nil)
}

pub fn int() -> Parser(Int) {
  {
    use _ <- bind(char(char.unsafe("-")))
    use n <- bind(nat())
    pure(-n)
  }
  |> alt(nat())
}

// 前後の空白を無視する
pub fn token(p: Parser(a)) -> Parser(a) {
  use _ <- bind(space())
  use v <- bind(p)
  use _ <- bind(space())
  pure(v)
}

pub fn identifier() -> Parser(String) {
  token(ident())
}

pub fn natural() -> Parser(Int) {
  token(nat())
}

pub fn integer() -> Parser(Int) {
  token(int())
}

pub fn symbol(s: String) -> Parser(String) {
  token(string(s))
}
