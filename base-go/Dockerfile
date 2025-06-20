FROM golang:1.23 as build

# Set the working directory
WORKDIR /go/src/app

# Copy and download dependencies
COPY go.mod go.sum ./
COPY modules/auth/go.mod modules/auth/go.sum ./modules/auth/
RUN go mod download

# Copy the source code
COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /go/bin/app

FROM alpine:latest

COPY --from=build /go/bin/app /

EXPOSE 8080
ENV PORT=8080

CMD ["/app"]