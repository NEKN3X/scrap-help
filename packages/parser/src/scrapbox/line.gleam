import gleam/string
import monadic_parser/parser.{bind, pure}
import scrapbox/helper

pub fn parser() {
  use indent <- bind(helper.indent())
  use text <- bind(helper.not_new_line())
  use _ <- bind(helper.eol())
  pure(Line(indent |> string.length, text))
}

pub type Line {
  Line(indent: Int, text: String)
}
