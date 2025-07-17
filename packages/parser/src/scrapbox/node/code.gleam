import monadic_parser/parser.{bind, pure}
import scrapbox/helper
import scrapbox/node/node

pub fn parser(options: node.Options) {
  case options {
    node.Options(False, _, False) -> {
      use _ <- bind(helper.osb())
      use x <- bind(helper.some_blank())
      use _ <- bind(helper.csb())
      pure(node.Blank("[" <> x <> "]", x))
    }
    _ -> parser.empty()
  }
}
