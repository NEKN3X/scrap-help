import monadic_parser/parser.{bind, pure}
import scrapbox/helper

pub fn parser() {
  use x <- bind(helper.line_text())
  pure(Plain(x, x))
}

pub type Plain {
  Plain(raw: String, text: String)
}
