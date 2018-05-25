#!/bin/sh
#
# This script replaces Ghost.app in a read-only dmg.

cd "$(dirname "$0")"

if [ ! -f ../electron-out/Ghost-darwin-x64/Ghost.app/Contents/Info.plist ]; then
    echo "electron-out/Ghost-darwin-x64/Ghost.app not found!"
    exit
fi

echo "Ghost.app found: ../electron-out/Ghost-darwin-x64/Ghost.app"

dmg=$(find ../electron-out/make -name "Ghost-*.dmg" -type f)

if [ ! -f $dmg ]; then
    echo "No dmg image found!"
    exit
fi

echo "dmg image found: $dmg"

echo "Attaching as shadow image\n\n"

hdiutil attach -owners on $dmg -shadow

echo "\n\n Detecting disk id"

disk=$(diskutil info "Ghost" | grep "Node" | sed 's/.*\(disk.*\)/\1/')

echo "It's $disk"

if [ ! -f /Volumes/Ghost/Ghost.app/Contents/Info.plist ]; then
    echo "/Volumes/Ghost/Ghost.app not found!"
    exit
fi

read -n 1 -s -r -p "Press any key to continue"

echo "\nRemoving /Volumes/Ghost/Ghost.app"
rm -rf /Volumes/Ghost/Ghost.app

read -n 1 -s -r -p "Press any key to continue"

echo "\nCopying in new app"
cp -a ../electron-out/Ghost-darwin-x64/Ghost.app/ /Volumes/Ghost/Ghost.app/

echo "Detaching disk"
hdiutil detach /dev/$disk

echo "Closing dmg image"
filename=$(basename $dmg)
hdiutil convert -format UDZO -o ../electron-out/$filename $dmg -shadow

echo "New dmg file created at electron-out/$filename"

echo "Cleaning up"
rm "$dmg.shadow"

