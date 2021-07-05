package io.fission

import org.springframework.http.RequestEntity
import org.springframework.http.ResponseEntity

internal class HelloWorld : Function<Any?, Any?> {
    override fun call(req: RequestEntity<*>, context: Context?): ResponseEntity<*> {
        val functionName = req.headers["x-fission-function-name"]?.first() ?: "I do not know who I are?!?"
        return ResponseEntity.ok("Hello, World! Greetings from function '$functionName' delivered by Kotlin!")
    }
}
