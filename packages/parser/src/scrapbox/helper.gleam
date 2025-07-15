import monadic_parser/char.{type Char}
import monadic_parser/parser.{alt, bind, many, pure, sat}

fn is_indent(c: Char) {
  char.is_space(c) || char.is_full_space(c) || char.is_tab(c)
}

pub fn indent() {
  use x <- bind(many(sat(is_indent)))
  pure(x |> char.join)
}

pub fn not_space() {
  use x <- bind(sat(fn(x) { !char.is_space(x) }))
  pure(x)
}

pub fn not_new_line() {
  use x <- bind(many(sat(fn(x) { !char.is_newline(x) })))
  pure(x |> char.join)
}

pub fn new_line() {
  use x <- bind(sat(char.is_newline))
  pure(x)
}

pub fn eol() {
  {
    use _ <- bind(new_line())
    pure("")
  }
  |> alt(pure(""))
}
