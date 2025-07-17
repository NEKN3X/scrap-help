import gleam/regexp
import gleam/string
import monadic_parser/char.{type Char}
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex

pub fn is_indent(c: Char) {
  char.is_space(c) || char.is_full_space(c) || char.is_tab(c)
}

pub fn indent() {
  p.sat(is_indent)
}

pub fn many_indent() {
  use x <- bind(p.many(indent()))
  pure(x |> char.join)
}

pub fn block_indent(base: Int) {
  p.nth_of(base + 1, indent())
}

pub fn not_space() {
  p.not(char.is_space)
}

pub fn line_text() {
  use x <- bind(p.many(p.not(char.is_newline)))
  pure(x |> char.join)
}

pub fn some_line_text() {
  use x <- bind(p.some(p.not(char.is_newline)))
  pure(x |> char.join)
}

pub fn new_line() {
  p.sat(char.is_newline)
}

pub fn eol() {
  {
    use _ <- bind(new_line())
    pure("")
  }
  |> p.alt(pure(""))
}

pub fn osb() {
  p.string("[")
}

pub fn csb() {
  p.string("]")
}

pub fn join_lines(lines) {
  lines |> string.join("\n")
}

pub fn some_blank() {
  use x <- bind(p.some(p.sat(char.is_blank)))
  pure(x |> char.join)
}

pub fn href() {
  let assert Ok(re) = regexp.from_string("^https?:\\/\\/[^\\s\\]]+")
  use match <- bind(regex.rematch(re))
  case match {
    regexp.Match(raw, []) -> pure(raw)
    _ -> p.empty()
  }
}
