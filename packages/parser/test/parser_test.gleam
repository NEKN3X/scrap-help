import gleam/option.{None, Some}
import gleeunit
import parser.{parse}
import simple/char

pub fn main() -> Nil {
  gleeunit.main()
}

// gleeunit test functions end in `_test`

pub fn item_test() {
  let p = parser.item()
  assert parse(p, "") == None
  assert parse(p, "abc") == Some(#(char.unsafe("a"), "bc"))
}

pub fn map_test() {
  let p = parser.item() |> parser.map(char.uppercase, _)
  assert parse(p, "abc") == Some(#(char.unsafe("A"), "bc"))
  assert parse(p, "") == None
}

pub fn pure_test() {
  let p = parser.pure(1)
  assert parse(p, "abc") == Some(#(1, "abc"))
}

pub fn apply_test() {
  let three = {
    let g = fn(x) { fn(_) { fn(z) { #(x, z) } } }
    parser.pure(g)
    |> parser.apply(parser.item())
    |> parser.apply(parser.item())
    |> parser.apply(parser.item())
  }
  assert parse(three, "abcdef")
    == Some(#(#(char.unsafe("a"), char.unsafe("c")), "def"))
  assert parse(three, "ab") == None
}

pub fn bind_test() {
  let three = {
    use x <- parser.bind(parser.item())
    use _ <- parser.bind(parser.item())
    use z <- parser.bind(parser.item())
    parser.pure(#(x, z))
  }
  assert parse(three, "abcdef")
    == Some(#(#(char.unsafe("a"), char.unsafe("c")), "def"))
  assert parse(three, "ab") == None
}

pub fn empty_test() {
  let p = parser.empty()
  assert parse(p, "abc") == None
}

pub fn alt_test() {
  let p = parser.alt(_, parser.pure(char.unsafe("d")))

  assert parse(parser.item() |> p, "abc") == Some(#(char.unsafe("a"), "bc"))
  assert parse(parser.empty() |> p, "abc") == Some(#(char.unsafe("d"), "abc"))
}

pub fn sat_test() {
  let a = parser.digit()
  assert parse(a, "123abc") == Some(#(char.unsafe("1"), "23abc"))
  assert parse(a, "abc") == None
  let b = parser.lower()
  assert parse(b, "abc") == Some(#(char.unsafe("a"), "bc"))
  assert parse(b, "ABC") == None
  let c = parser.upper()
  assert parse(c, "ABC") == Some(#(char.unsafe("A"), "BC"))
  assert parse(c, "abc") == None
  let d = parser.letter()
  assert parse(d, "abc") == Some(#(char.unsafe("a"), "bc"))
  assert parse(d, "ABC") == Some(#(char.unsafe("A"), "BC"))
  assert parse(d, "123") == None
  let e = parser.alpha_num()
  assert parse(e, "abc") == Some(#(char.unsafe("a"), "bc"))
  assert parse(e, "ABC") == Some(#(char.unsafe("A"), "BC"))
  assert parse(e, "123") == Some(#(char.unsafe("1"), "23"))
  assert parse(e, "!@#") == None
}

pub fn char_test() {
  let p = parser.char(char.unsafe("a"))
  assert parse(p, "abc") == Some(#(char.unsafe("a"), "bc"))
}

pub fn string_test() {
  let p = parser.string("abc")
  assert parse(p, "abcdef") == Some(#("abc", "def"))
  assert parse(p, "ab1234") == None
  assert parse(p, "") == None
  let q = parser.string("")
  assert parse(q, "abc") == Some(#("", "abc"))
  assert parse(q, "") == Some(#("", ""))
}

pub fn many_some_test() {
  let a = parser.ident()
  assert parse(a, "abc def") == Some(#("abc", " def"))
  let b = parser.nat()
  assert parse(b, "123 abc") == Some(#(123, " abc"))
  let c = parser.space()
  assert parse(c, "   abc") == Some(#(Nil, "abc"))
}
