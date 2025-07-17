import monadic_parser/parser.{bind, pure}
import scrapbox/helper
import scrapbox/node/node.{CommandLine}

pub fn parser(options: node.Options) {
  case options {
    node.Options(False, False, False, _) -> {
      use symbol <- bind(parser.string("$") |> parser.alt(parser.string("%")))
      use _ <- bind(parser.space())
      use x <- bind(helper.some_line_text())
      pure(CommandLine(symbol <> " " <> x, symbol, x))
    }
    _ -> parser.empty()
  }
}
