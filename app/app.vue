<template>
  <Html>
    <Body>
      <NuxtRouteAnnouncer />
      <main class="min-h-screen bg-gray-100">
        <div class="container mx-auto p-4">
          <div class="grid grid-cols-2 gap-8">
            <div />
            <div class="flex flex-col gap-4 items-center justify-center">
              <Badge>
                <template #canvas>
                  <canvas
                    ref="badgeCanvas"
                    width="444"
                    height="192"
                    class="mb-4 border-2"
                  />
                </template>
              </Badge>
            </div>
          </div>
        </div>
      </main>
    </Body>
  </Html>
</template>
