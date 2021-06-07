
# 업데이트 목록
- DOCS 기호 '#>>'로 수정  
  DOCS 머릿기호와 샘플 생성기호가 겹쳐서 불편함.
- DOCS 줄바꿈시 DOCS 외 글자가 지워지는 현상.

- 컴포넌트에 따른 DOCS 샘플 및 어노테이션  
  - DOCS  
    @param - docs 파라메터  
    @return - docs 리턴

  - 어노테이션  
    @Search(false) 서칭 제외 - WorkspaceSymbolProvider  
    @Complete(false) 자동완성 제외 - CompletionItemProvider   
    또는  
    @options(search:false, complete:false)

- 시매틱 구문강조 프로바이더 검색해볼것.

<br>

<br>

# 깃 명령어
- git clone : 레포지토리의 내용을 복제
- git push : 레포지토리로 내용을 보냄
- git pull : 레포지토리의 내용을 가져옴
- git fetch : 레포지토리에서 변경 내용 가져옴  
  <br>
- 깃 설정 모두 보기 : git config --list
- user.name 설정 : git config --global user.name "vhone"
- user.email 설정 : git config --global user.email "kiyouin16@gmail.com"
- git config 삭제 : git config --unset user.name
  - global 삭제 : git config --unset --global user.name  
  <br>
- 레포지토리 remote: git remote origin add https://github.com/vhone/testrp.git
- remote 확인: git remote -v
- commit 대상 선택: stage로 이동시키기
- commit : V체크