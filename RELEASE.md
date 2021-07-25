# v0.0.6
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
4. Docs Keyword
   - 커서 위치 = "|"
   - 변경 전: "#>| DOCS" + Enter
   - 변경 후: "#>>|" + Enter
5. Docs Annotation
   - @invisible : 외부 파일에서 자동완성에 표시되지 않음.
     ```vskript
     #> @invisible
     function fxTest():
        true is true
     ```
6. Fixed
    - 띄어쓰기로 들여쓰기 한 경우 인식이 안되던 문제
  