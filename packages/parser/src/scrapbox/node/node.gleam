import gleam/option.{Some}
import gleam/regexp
import monadic_parser/char
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex
import scrapbox/helper
import scrapbox/node/deco

pub fn plain() {
  use x <- bind(helper.line_text())
  pure(Plain(x))
}

pub fn deco() {
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
  use nodes <- bind(case p.parse(parser(True), text) {
    Some(#(nodes, "")) -> pure(nodes)
    _ -> p.empty()
  })
  pure(Deco("[" <> deco <> " " <> text <> "]", nodes))
}

pub fn parser(nested: Bool) {
  use n <- bind(case nested {
    True -> {
      use p <- bind(plain())
      pure([p])
    }
    False -> p.many(deco())
  })
  pure(n)
}

pub type Node {
  Deco(raw: String, nodes: List(Node))
  Plain(String)
}
