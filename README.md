# VSkript 
VSkript는 마인크래프트(JE)의 Skript플러그인을 위한 Extension입니다.  

주요 기능은 함수의 확장입니다.  
skripts 폴더에 저장된 사용가능한 모든 스크립트 문서에서 함수를 읽습니다.  
함수 툴팁, 정의된 페이지로 바로가기 등 편리한 기능을 제공합니다.

익스텐션에 대한 피드백은 아래의 링크로 보내주세요.  
[[마켓플레이스 Q&A](https://marketplace.visualstudio.com/items?itemName=Vhone.vskript&ssr=false#qna)],
[[네이버 블로그](https://blog.naver.com/v_hone)]

# 기능 (Features)
1. 코드 하이라이트 (Code Highlight)
	- 몇몇 이벤트와 타입에 대해서는 표시되지 않을 수 있습니다.
2. 컬러 미리보기 (Color Provider)
	- '<##000000>' 형태의 헥사컬러코드를 사용하면 컬러 미리보기가 됩니다.
	- 헥사컬러코드에 마우스를 올리면 컬러 피커를 사용할 수 있습니다.
3. 아웃라인 (OutLine)
	- Options, Aliases, Command, Event, Function의 심볼이 아웃라인에 등록됩니다.
4. 툴팁 (Tootip)  
	![screensh](https://github.com/vhone/vskript/blob/main/img/tooltip.gif)
	- Options, Aliases, Function에 툴팁이 적용됩니다.  
5. 함수 확장 (Function Extensions)  
![screensh](https://github.com/vhone/vskript/blob/main/img/function%20docs.gif)
    - 문서 (Docs)
		- 함수 위에 '#>'를 입력하면 '#> DOCS'로 변경됩니다.
		- 그대로 Enter를 입력하면 함수 설명에 필요한 요소들이 생성됩니다.
		- MarkDown으로 함수의 설명을 작성할 수 있습니다.
	- 툴팁 (Tooltip)
   		- 함수에 커서를 올리면 문서에서 정의한 함수 설명을 볼 수 있습니다.
	- 자동완성 (Completion)
		- 단축키(Ctrl+Space)로 함수 자동완성 목록을 사용 할 수 있습니다.
		- 문서에서 정의한 함수 설명을 볼 수 있습니다.
	- 심볼 (Symbol)
		- 단축키(Ctrl+Shift+O)를 사용해 Document의 심볼을 사용할 수 있습니다.
		- 단축키(Ctrl+T)를 사용해 WorkSapce의 심볼을 사용할 수 있습니다.
	- 바로가기 (go to Definition)
		- 단축키(f12)를 눌러 함수가 정의된 페이지로이동 할 수 있습니다.
		- 함수이름에 커서를 올리고 Ctrl + Click으로 함수 바로가기를 사용할 수 있습니다.'