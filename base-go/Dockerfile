FROM golang@sha256:9bdd5692d39acc3f8d0ea6f81327f87ac6b473dd29a2b6006df362bff48dd1f8 as build

# Set the working directory
WORKDIR /go/src/app

# Copy and download dependencies
COPY go.mod go.sum ./
COPY modules/auth/go.mod modules/auth/go.sum ./modules/auth/
RUN go mod download

# Copy the source code
COPY . .

RUN CGO_ENABLED=0 go build -o /go/bin/app

FROM gcr.io/distroless/static-debian12@sha256:262ae336f8e9291f8edc9a71a61d5d568466edc1ea4818752d4af3d230a7f9ef

COPY --from=build /go/bin/app /

EXPOSE 8080
ENV PORT 8080

CMD ["/app"]