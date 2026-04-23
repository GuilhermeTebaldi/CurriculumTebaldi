on run
  try
    do shell script "/Users/admin/Documents/CRIADORDECURICULO/scripts/logo_trimmer_launcher.command"
  on error errMsg
    display dialog errMsg buttons {"OK"} default button "OK"
  end try
end run
