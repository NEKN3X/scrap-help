import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/title.{Title}

pub fn parser_test() {
  let p = title.parser()
  assert parse(p, "abc") == Some(#("abc", ""))
  assert parse(p, " abc\t") == Some(#(" abc\t", ""))
  assert parse(p, " \t abc") == Some(#(" \t abc", ""))
  assert parse(p, " \t　\n\n\nabc") == Some(#(" \t　\n\n\nabc", ""))
  assert parse(p, " \t　title\nnewline\nnewline")
    == Some(#(" \t　title", "\nnewline\nnewline"))
  assert parse(p, "") == None
  assert parse(p, " 　\t") == None
  assert parse(p, " \n 　\t") == None
}

pub fn title_test() {
  let e = title.extract
  assert e("abc") == Title("abc", "abc")
  assert e(" abc\t") == Title(" abc\t", "abc")
  assert e(" \t abc") == Title(" \t abc", "abc")
  assert e(" \t　\n\n\nabc") == Title(" \t　\n\n\nabc", "abc")
  assert e(" \t　title\nnewline\nnewline") == Title(" \t　title", "title")
  assert e("") == Title("", "Untitled")
  assert e(" 　\t") == Title(" 　\t", "Untitled")
  assert e(" \n 　\t") == Title(" \n 　\t", "Untitled")
  assert e("\tHello,  World ") == Title("\tHello,  World ", "Hello,__World")
  assert e("\tHello,  [World ") == Title("\tHello,  [World ", "Hello,_World")
  assert e("\tHello,  [aaa]World ")
    == Title("\tHello,  [aaa]World ", "Hello,_aaa_World")
  assert e("\tHello,  aaa] [World")
    == Title("\tHello,  aaa] [World", "Hello,__aaa__World")
  assert e("\tHello,  aaa]    [  [aaa  ]  b bWorld")
    == Title(
      "\tHello,  aaa]    [  [aaa  ]  b bWorld",
      "Hello,__aaa___aaa_b_bWorld",
    )
  assert e(
      "


	Hello,  aaa]    [  [aaa  ]  b bWorld",
    )
    == Title(
      "\n\n\n\tHello,  aaa]    [  [aaa  ]  b bWorld",
      "Hello,__aaa___aaa_b_bWorld",
    )
}
