import gleam/list
import gleam/string
import monadic_parser/char
import monadic_parser/parser.{bind, pure} as p
import scrapbox/helper
import scrapbox/node/deco

pub fn plain() {
  use x <- bind(helper.line_text())
  pure(Plain(x))
}

pub fn deco() {
  use _ <- bind(p.char(char.new("[")))
  use deco <- bind(p.some(p.sat(deco.decoration_char)))
  use _ <- bind(p.space())
  use n <- bind(parser(True))
  use _ <- bind(p.char(char.new("]")))
  pure(Deco(
    "["
      <> deco |> char.join
      <> " "
      <> n |> list.map(get_raw) |> string.concat
      <> "]",
    n,
  ))
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

fn get_raw(node: Node) -> String {
  case node {
    Deco(raw, _) -> raw
    Plain(s) -> s
  }
}
