import gleam/option.{Some}
import gleam/regexp
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex
import scrapbox/helper
import scrapbox/node/node.{ExternalLink}

pub fn parser() {
  {
    use _ <- bind(helper.osb())
    use href <- bind(helper.href())
    use blank <- bind(helper.some_blank())
    let assert Ok(re) = regexp.from_string("^([^\\]]*\\]?[^\\]]*)\\]")
    use match <- bind(regex.rematch(re))
    use text <- bind(case match {
      regexp.Match(_, [Some(x)]) -> pure(x)
      _ -> p.empty()
    })
    pure(ExternalLink("[" <> href <> blank <> text <> "]", href, text))
  }
  |> p.alt({
    use _ <- bind(helper.osb())
    use href <- bind(helper.href())
    use _ <- bind(helper.csb())
    pure(ExternalLink("[" <> href <> "]", href, ""))
  })
  |> p.alt({
    use href <- bind(helper.href())
    use blank <- bind(helper.some_blank())
    use text <- bind(helper.line_text())
    pure(ExternalLink(href <> blank <> text, href, text))
  })
}
