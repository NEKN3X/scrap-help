import gleam/option.{Some}
import monadic_parser/parser.{parse}
import scrapbox/line.{Line}

pub fn line_test() {
  let p = line.parser()
  assert parse(p, "  This is a line\n\nabc")
    == Some(#(Line(2, "This is a line"), "\nabc"))
  assert parse(p, "") == Some(#(Line(0, ""), ""))
}
