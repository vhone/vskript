# Updata v0.0.9
1. Syntax Highlight
	- 2.8 버전 컬러 테마 지원
	- White 버전 테마 추가

# Updata v0.0.8
1. Syntax Highlight
	- skript-reflect 애드온 패턴 추가

# Update v0.0.7
1. Syntax Highlight
   - 문자 표현에서 모든 종류 컬러 표시 (&7, §7, \<grey\> 등) (참조 : https://skriptlang.github.io/Skript/text.html)
   - 문자 표현에서 \{\@option\} 변수 강조
   - Option의 값 영역에 하이라이트 적용
   - Exit, Continue 이펙트에 제어문 스타일 적용
   - boolean에 숫자 스타일(흰색) 적용
   - skript 2.6의 새로운 문법 'parse if'와 'do while'에 문법 스타일(주황색, 볼드) 적용
2. Fixed
   - 함수 파타메터의 타입에서 'string' 강조


# Update v0.0.6
1. Syntax Highlight
   - 색상 변경
    - 변수와 글자에 중첩 익스프레션 패턴 추가
   - 글자에 컬러코드(&[0-9a-fA-F]) 사용시 색상 표시
   - Periodical Event 색상 적용
2. Semantic Highlight
   - Aliases 표시
   - Function 매개변수 표시
3. Outline
   - Event, Command, Function에서 사용된 지역변수 표기
     - 최초 사용된 위치로 바로가기
     - 사용 횟수 표기
   - Command 옵션 표기
   - At Time, Periodical Event 표기
4. Docs Trigger Key
   - 변경 전: "#> DOCS" + Enter
   - 변경 후: "#>>" + Enter
5. Docs Annotation
   - @invisible : 심볼 검색 차단
     ```vskript
     #> @invisible
     function fxTest():
        true is true
     ```
6. Fixed
    - 띄어쓰기로 들여쓰기 한 경우 인식이 안되던 문제