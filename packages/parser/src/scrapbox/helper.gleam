import monadic_parser/char.{type Char}
import monadic_parser/parser.{bind, pure} as p

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
