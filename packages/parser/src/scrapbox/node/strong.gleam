import monadic_parser/parser.{bind, pure}
import scrapbox/helper

pub fn parser() {
  use x <- bind(helper.line_text())
  pure(Strong(x, x))
}

pub type Strong {
  Strong(raw: String, text: String)
}
