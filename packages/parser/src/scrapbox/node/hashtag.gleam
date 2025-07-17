import monadic_parser/char
import monadic_parser/parser.{bind, pure} as p
import scrapbox/helper
import scrapbox/node/node.{HashTag, Plain}

fn blank_then_hashtag() {
  use blank <- bind(p.blank())
  let blank = blank |> char.to_string
  use _ <- bind(p.string("#"))
  use text <- bind(helper.some_not_blank())
  pure([Plain(blank), HashTag("#" <> text, text)])
}

pub fn parser(options: node.Options) {
  case options {
    node.Options(_, _, False, True) ->
      {
        use _ <- bind(p.string("#"))
        use text <- bind(helper.some_not_blank())
        pure([HashTag("#" <> text, text)])
      }
      |> p.alt(blank_then_hashtag())
    node.Options(_, _, False, _) -> blank_then_hashtag()
    _ -> p.empty()
  }
}
