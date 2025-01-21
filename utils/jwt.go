// utils/jwt.go
package utils

import (
	"time"

	"github.com/golang-jwt/jwt"
)

var jwtSecret = "thisismysecurekey"

func GenerateJWT(email string, id string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["email"] = email
	claims["id"] = id
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	return token.SignedString([]byte(jwtSecret))
}
