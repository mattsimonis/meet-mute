tell application "Brave Browser"
	activate
	delay 0.3
end tell

tell application "System Events"
	tell process "Brave Browser"
		set theTitle to do shell script "osascript -e 'tell app \"brave browser\" to get the title of the active tab of window 1'" as text
		delay 0.2
		set theTitle to theTitle & " - Brave"
		tell window theTitle
			tell group theTitle
				tell toolbar 1
					tell pop up button "Muted"
						--click
						perform action "AXPress"
					end tell
				end tell
			end tell
		end tell
	end tell
end tell
