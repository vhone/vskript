<p align="center"><img src="img/cover.png"></p>

<br>

# VSkript 
VSkript는 마인크래프트(JE)의 Skript 플러그인을 위한 익스텐션입니다.  
스크립트의 함수를 보다 편리하게 사용하기 위해서 제작되었습니다.

작업공간은 반드시 'skripts' 폴더로 해야합니다.
vscode에서 작업공간을 준비 할 때 활성화된 모든 스크립트 파일을 읽습니다.
비활성 된 스크립트는 코드 하이라이트를 제외한 대부분의 기능이 동작하지 않습니다.

익스텐션에 대한 피드백은 아래의 링크로 보내주세요.  
[[마켓플레이스 Q&A](https://marketplace.visualstudio.com/items?itemName=Vhone.vskript&ssr=false#qna)],
[[네이버 블로그](https://blog.naver.com/v_hone/222386247124)]

<br>

# Update v0.0.7
1. Syntax Highlight
   - 문자 표현에서 모든 종류 컬러 표시 (&7, §7, \<grey\> 등) (참조 : https://skriptlang.github.io/Skript/text.html)
   - 문자 표현에서 \{\@option\} 변수 강조
   - Option의 값 영역에 하이라이트 적용
   - Exit, Continue 이펙트에 제어문 스타일 적용
   - boolean에 숫자 스타일 적용

2. Fixed
   - 함수 파타메터의 타입에서 'string' 강조

<br>

# 기능 (Features)
1. 코드 하이라이트 (Code Highlight)  
	![outline](img/code_highlight.gif)
	- 일부 패턴에서 코드 하이라이트가 깨질 수 있습니다.  
	<br><br>
2. 컬러 미리보기 (Color Provider)  
	![outline](img/color_picker.gif)
	- '<##000000>' 형태의 헥사코드에 마우스 커서를 올리면 피커가 나타납니다.
	- 피커를 사용하여 핵사코드를 변경할 수 있습니다.  
	<br><br>
3. 아웃라인 (OutLine)  
	![outline](img/outline.png)
	- Options, Aliases, Command, Event, Function이 아웃라인에 등록됩니다.  
	<br><br>
4. 툴팁 (Tootip)  
	![tooltip](img/tooltip.gif)
	- Option과 Alias에 마우스 커서를 올리면 값을 툴팁으로 표시합니다.
	- Option은 아웃라인 패널에서 변수가 아닌 값으로 표시됩니다.
	<br><br>
5. 함수 확장 (Function Extensions)   
    - 함수 문서 (Function Docs)  
![function_docs](img/function_docs.gif)
		- Docs 주석은 주석'#' 뒤에 꺽쇠'>'를 붙인 것을 머릿말로 합니다.
		- 함수 윗쪽에 '#>>' 입력 후 Enter를 하면 함수 Docs가 생성됩니다.
		- Docs 주석은 MarkDown을 사용하여 함수의 툴팁을 작성할 수 있습니다.
   		- 함수 이름에 마우스 커서를 올리면 문서에서 정의한 툴팁을 볼 수 있습니다.    
		<br>
	- 자동완성 (Completion)   
![function_docs](img/function_completion.gif)
		- 단축키(Ctrl+Space)로 함수 자동완성 목록을 사용 할 수 있습니다.   
		- ( 아직 완성된 기능이 아닙니다. )   
	    <br>
	- 심볼 검색 (Symbol Search)
![function_docs](img/symbol_search.gif)   
		- 단축키(Ctrl + T)를 사용해 모든 문서의 스크립트 요소를 검색 할 수 있습니다.   
		- 단축키(Ctrl + Shift + .)를 사용해 현재 열린 문서의 스크립트 요소를 검색 할 수 있습니다.   
		- Docs 주석에 @invisible을 추가하면 검색을 차단합니다.  
		- 검색 차단은 Function 뿐만 아니라 Aliases, Options, Command, Event에도 적용 됩니다.   
		- 검색 차단된 함수는 자동완성에도 표시되지 않습니다.   
		<br>
	- 바로가기 (go to Definition)   
![function_docs](img/goto_definition.gif)
		- Ctrl + 좌클릭으로 함수가 정의된 페이지로 이동 할 수 있습니다.
		- 문자 커서가 함수 위에 있을 때 단축키(F12)를 눌러 함수가 정의된 페이지로 이동 할 수 있습니다.   
