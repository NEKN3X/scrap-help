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
import scrapbox/node/node.{Deco}

pub type Options {
  Options(nested: Bool, quoted: Bool, table: Bool)
}

pub fn plain() {
  use x <- bind(helper.line_text())
  pure([node.Plain(x)])
}

pub fn deco(options: Options) {
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
    case p.parse(parser(Options(..options, nested: True)), text) {
      Some(#(nodes, "")) -> pure(nodes)
      _ -> p.empty()
    },
  )
  pure(Deco("[" <> deco <> " " <> text <> "]", nodes))
}

pub fn parser(options: Options) {
  case options {
    Options(False, False, False) ->
      p.many(command_line.parser())
      |> p.alt(plain())
    Options(True, _, _) -> plain()
    Options(False, _, False) ->
      p.many(blank.parser() |> p.alt(code.parser()) |> p.alt(deco(options)))
      |> p.alt(plain())
    _ -> plain()
  }
}
