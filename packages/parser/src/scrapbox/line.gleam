import gleam/string
import monadic_parser/parser.{bind, pure}
import scrapbox/helper

pub fn parser() {
  use indent <- bind(helper.many_indent())
  use text <- bind(helper.line_text())
  use _ <- bind(helper.eol())
  pure(Line(indent |> string.length, text))
}

pub type Line {
  Line(indent: Int, text: String)
}
