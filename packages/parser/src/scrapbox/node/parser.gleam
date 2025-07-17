import gleam/io
import gleam/option.{Some}
import gleam/regexp
import monadic_parser/char
import monadic_parser/parser.{bind, pure} as p
import monadic_parser/regex
import scrapbox/helper
import scrapbox/node/blank
import scrapbox/node/code
import scrapbox/node/command_line
import scrapbox/node/deco
import scrapbox/node/external_link
import scrapbox/node/node.{Deco}

pub fn plain() {
  use x <- bind(helper.line_text())
  pure([node.Plain(x)])
}

pub fn deco(options: node.Options) {
  case options {
    node.Options(False, _, False) -> {
      use _ <- bind(helper.osb())
      use deco <- bind(p.some(p.sat(deco.decoration_char)))
      let deco = deco |> char.join
      use _ <- bind(p.space())
      let assert Ok(re) = regexp.from_string("^(.*)\\]")
      use match <- bind(regex.rematch(re))
      use text <- bind(case match {
        regexp.Match(_, [Some(x)]) -> pure(x)
        _ -> p.empty()
      })
      use nodes <- bind(
        case p.parse(parser(node.Options(..options, nested: True)), text) {
          Some(#(nodes, "")) -> pure(nodes)
          Some(#(nodes, a)) -> {
            io.print(a)
            pure(nodes)
          }
          _ -> p.empty()
        },
      )
      pure(Deco("[" <> deco <> " " <> text <> "]", nodes))
    }
    _ -> p.empty()
  }
}

pub fn parser(options: node.Options) {
  p.some(
    blank.parser(options)
    |> p.alt(code.parser(options))
    |> p.alt(command_line.parser(options))
    |> p.alt(external_link.parser(options))
    |> p.alt(deco(options)),
  )
  |> p.alt(plain())
}
