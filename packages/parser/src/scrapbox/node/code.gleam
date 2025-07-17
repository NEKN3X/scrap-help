import monadic_parser/parser.{bind, pure}
import scrapbox/helper
import scrapbox/node/node

pub fn parser() {
  use _ <- bind(parser.string("`"))
  use x <- bind(helper.some_blank())
  use _ <- bind(parser.string("`"))
  pure(node.Code("`" <> x <> "`", x))
}
