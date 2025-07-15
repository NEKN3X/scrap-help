import monadic_parser/char.{type Char}
import monadic_parser/parser.{alt, bind, many, pure, sat}

pub fn is_indent(c: Char) {
  char.is_space(c) || char.is_full_space(c) || char.is_tab(c)
}

pub fn indent() {
  sat(is_indent)
}

pub fn many_indent() {
  use x <- bind(many(indent()))
  pure(x |> char.join)
}

pub fn block_indent(base: Int) {
  parser.nth_of(base + 1, indent())
}

pub fn not_space() {
  parser.not(char.is_space)
}

pub fn line_text() {
  use x <- bind(many(parser.not(char.is_newline)))
  pure(x |> char.join)
}

pub fn new_line() {
  sat(char.is_newline)
}

pub fn eol() {
  {
    use _ <- bind(new_line())
    pure("")
  }
  |> alt(pure(""))
}
