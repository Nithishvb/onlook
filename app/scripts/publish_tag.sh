# Get the version from package.json
VERSION=$(node -p "require('./package.json').version")

# Add all changes to the staging area
git add .

# Commit changes with a message
git commit -m "Incremented version v$VERSION"

# Create an annotated tag
git tag -a v$VERSION -m "Version $VERSION"

# Push the tag to the remote repository
git push origin v$VERSION  --follow-tags