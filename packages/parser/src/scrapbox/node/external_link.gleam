import gleam/option.{Some}
import gleam/regexp
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex
import scrapbox/helper
import scrapbox/node/node.{ExternalLink}

fn href_text() {
  use _ <- bind(helper.osb())
  use href <- bind(helper.href())
  use blank <- bind(helper.some_blank())
  let assert Ok(re) = regexp.from_string("^([^\\]]*[^ 　\t])\\]")
  use match <- bind(regex.rematch(re))
  use text <- bind(case match {
    regexp.Match(_, [Some(x)]) -> pure(x)
    _ -> p.empty()
  })
  pure(ExternalLink("[" <> href <> blank <> text <> "]", href, text))
}

fn text_href() {
  use _ <- bind(helper.osb())
  let assert Ok(re) = regexp.from_string("^([^\\]]*[^ 　\t])([ 　\t])")
  use match <- bind(regex.rematch(re))
  use #(text, blank) <- bind(case match {
    regexp.Match(_, [Some(x), Some(y)]) -> pure(#(x, y))
    _ -> p.empty()
  })
  use href <- bind(helper.href())
  use _ <- bind(helper.csb())
  pure(ExternalLink("[" <> text <> blank <> href <> "]", href, text))
}

pub fn parser(options: node.Options) {
  case options {
    node.Options(_, _, False, _) -> {
      href_text()
      |> p.alt(text_href())
      |> p.alt({
        use _ <- bind(helper.osb())
        use href <- bind(helper.href())
        use _ <- bind(helper.csb())
        pure(ExternalLink("[" <> href <> "]", href, ""))
      })
      |> p.alt({
        use href <- bind(helper.href())
        pure(ExternalLink(href, href, ""))
      })
    }
    _ -> p.empty()
  }
}
