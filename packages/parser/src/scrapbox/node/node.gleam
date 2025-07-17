import gleam/option.{Some}
import gleam/regexp
import monadic_parser/char
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex
import scrapbox/helper
import scrapbox/node/deco

pub type Options {
  Options(nested: Bool, quoted: Bool)
}

pub fn plain() {
  use x <- bind(helper.line_text())
  pure(Plain(x))
}

pub fn deco(options: Options) {
  use _ <- bind(p.char(char.new("[")))
  use deco <- bind(p.some(p.sat(deco.decoration_char)))
  let deco = deco |> char.join
  use _ <- bind(p.space())
  let assert Ok(re) = regexp.from_string("^(.*)\\]")
  use text <- bind(regex.rematch(re))
  use text <- bind(case text {
    regexp.Match(_, [Some(text)]) -> pure(text)
    _ -> p.empty()
  })
  use nodes <- bind(
    case p.parse(parser(Options(..options, nested: True)), text) {
      Some(#(nodes, "")) -> pure(nodes)
      _ -> p.empty()
    },
  )
  pure(Deco("[" <> deco <> " " <> text <> "]", nodes))
}

pub fn parser(options: Options) {
  case options {
    Options(True, _) -> {
      use p <- bind(plain())
      pure([p])
    }
    Options(False, _) -> p.many(deco(options))
  }
}

pub type Node {
  Deco(raw: String, nodes: List(Node))
  Plain(String)
}
