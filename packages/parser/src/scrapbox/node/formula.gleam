import gleam/option.{Some}
import gleam/regexp
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex
import scrapbox/helper
import scrapbox/node/node.{Formula}

pub fn parser(options: node.Options) {
  case options {
    node.Options(False, False, False) -> {
      {
        use _ <- bind(helper.osb())
        use symbol <- bind(p.string("$"))
        use _ <- bind(p.space())
        let assert Ok(re) = regexp.from_string("^(.*) \\]")
        use match <- bind(regex.rematch(re))
        use text <- bind(case match {
          regexp.Match(_, [Some(x)]) -> pure(x)
          _ -> p.empty()
        })
        pure(Formula("[" <> symbol <> " " <> text <> " ]", text))
      }
      |> p.alt({
        use _ <- bind(helper.osb())
        use symbol <- bind(p.string("$"))
        use _ <- bind(p.space())
        let assert Ok(re) = regexp.from_string("^[^\\]]+")
        use match <- bind(regex.rematch(re))
        use text <- bind(case match {
          regexp.Match(raw, []) -> pure(raw)
          _ -> p.empty()
        })
        use _ <- bind(helper.csb())
        pure(Formula("[" <> symbol <> " " <> text <> "]", text))
      })
    }
    _ -> p.empty()
  }
}
