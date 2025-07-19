import monadic_parser/parser.{bind, pure}
import scrapbox/helper
import scrapbox/node/node.{Helpfeel}

pub fn parser(options: node.Options) {
  case options {
    node.Options(False, False, False, True) -> {
      use _ <- bind(parser.string("?"))
      use _ <- bind(parser.blank())
      use x <- bind(helper.some_line_text())
      pure(Helpfeel("? " <> x, x))
    }
    _ -> parser.empty()
  }
}
