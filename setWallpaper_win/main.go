package main

import (
	"syscall"
	"unsafe"
	"os"
	"image/jpeg"
	"golang.org/x/image/bmp"
	"path"
	"strings"
	"fmt"
)

func StrPtr(s string) uintptr {
	return uintptr(unsafe.Pointer(syscall.StringToUTF16Ptr(s)))
}

func setWallPaper1(imgPath string) {
	dll, err := syscall.LoadLibrary("user32.dll")
	if err != nil {
		panic(err)
	}
	defer syscall.FreeLibrary(dll)
	SystemParametersInfo, err1 := syscall.GetProcAddress(dll, "SystemParametersInfoW")
	if err1 != nil {
		panic(err1)
	}
	ret, _, callErr := syscall.Syscall6(
		SystemParametersInfo,
		4,
		20,
		1,
		StrPtr(imgPath),
		0x1 | 0x2,
		0,
		0)
	if callErr != 0 || ret != 1 {
		panic("failed")
	}
}

func setWallPaper2(imgPath string) {
	dll := syscall.NewLazyDLL("user32.dll")
	proc := dll.NewProc("SystemParametersInfoW")
	ret, _, _ := proc.Call(20, 1,
		uintptr(unsafe.Pointer(syscall.StringToUTF16Ptr(imgPath))),
			0x1 | 0x2)
	fmt.Print(ret)
}

func jpg2bmp(jpgPath string, bmpPath string) {
	jpgFile, errOpen := os.Open(jpgPath)
	if errOpen != nil {
		panic("open jpg file failed")
	}
	defer jpgFile.Close()
	img, errDecode := jpeg.Decode(jpgFile)
	if errDecode != nil {
		panic("decode jpeg file failed")
	}
	bmpFile, errOpen := os.Create(bmpPath)
	if errOpen != nil {
		panic("open bmp file failed")
	}
	defer bmpFile.Close()
	errEncode := bmp.Encode(bmpFile, img)
	if errEncode != nil {
		panic("encode bmp file failed")
	}
}

func main() {
	if len(os.Args) < 2 {
		panic("need image path")
	}
	imgPath := os.Args[1]
	// imgPath := "D:/Pictures/wp.jpg"
	ext := path.Ext(imgPath)
	if ext != ".bmp" && ext != ".jpg" {
		panic("unsupport ext " + ext)
	}
	if ext == ".jpg" {
		outPath := strings.TrimSuffix(imgPath, ext) + ".bmp"
		jpg2bmp(imgPath, outPath)
		imgPath = outPath
	}
	setWallPaper2(imgPath)
	// setWallPaper1(imgPath)
}