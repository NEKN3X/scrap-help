import gleam/list
import gleam/string
import monadic_parser/parser.{alt, bind, many, pure}
import scrapbox/helper

fn content_line(base: Int) {
  use _ <- bind(helper.block_indent(base))
  use text <- bind(helper.line_text())
  pure(text)
}

fn content(base: Int) {
  use first_line <- bind(content_line(base))
  use lines <- bind(
    many({
      use _ <- bind(helper.new_line())
      use line <- bind(content_line(base))
      pure(line)
    }),
  )
  pure([first_line] |> list.append(lines) |> string.join("\n"))
}

pub fn parser() {
  use indent <- bind(helper.many_indent())
  let indent_size = indent |> string.length
  use _ <- bind(parser.symbol("code:"))
  use title <- bind(helper.line_text())
  use content <- bind(
    {
      use _ <- bind(helper.new_line())
      use content <- bind(content(indent_size))
      use _ <- bind(helper.eol())
      pure(content)
    }
    |> alt(helper.eol()),
  )

  pure(CodeBlock(indent_size, title, content))
}

pub type CodeBlock {
  CodeBlock(indent: Int, title: String, content: String)
}
